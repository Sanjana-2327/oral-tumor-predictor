import os
from typing import List, Tuple

import numpy as np
import pandas as pd

try:
    import tensorflow as tf
    from tensorflow.keras import layers, models
except Exception:
    tf = None
    layers = None
    models = None


def _read_csvs(data_dir: str) -> pd.DataFrame:
    frames: List[pd.DataFrame] = []
    for name in os.listdir(data_dir):
        if not name.lower().endswith(".csv"):
            continue
        path = os.path.join(data_dir, name)
        try:
            df = pd.read_csv(path)
            # normalize expected columns
            if "Follow_Up_Month" in df.columns:
                df.rename(columns={"Follow_Up_Month": "month_index"}, inplace=True)
            if "Tumor_Size_cm" in df.columns:
                df.rename(columns={"Tumor_Size_cm": "tumor_size_cm"}, inplace=True)
            if "Patient_ID" in df.columns:
                df.rename(columns={"Patient_ID": "patient_id"}, inplace=True)
            frames.append(df)
        except Exception:
            continue
    if not frames:
        raise RuntimeError("No CSVs found or readable in data directory")
    df_all = pd.concat(frames, ignore_index=True)
    # keep essential columns
    keep = [c for c in ["patient_id", "month_index", "tumor_size_cm"] if c in df_all.columns]
    df_all = df_all[keep].dropna()
    return df_all


def _build_sequences(df: pd.DataFrame, lookback: int = 3, horizon: int = 12) -> Tuple[np.ndarray, np.ndarray]:
    if "patient_id" not in df.columns:
        df = df.copy()
        df["patient_id"] = 0
    X_list: List[np.ndarray] = []
    y_list: List[np.ndarray] = []
    for pid, grp in df.groupby("patient_id"):
        g = grp.sort_values("month_index")
        series = g["tumor_size_cm"].astype(float).values
        if len(series) < lookback + 1:
            continue
        for i in range(len(series) - lookback):
            window = series[i : i + lookback]
            future = series[i + lookback : i + lookback + 1]  # next step
            if len(future) < 1:
                continue
            X_list.append(window)
            y_list.append(future)
    if not X_list:
        raise RuntimeError("Insufficient sequence data for training")
    X = np.array(X_list, dtype="float32").reshape((-1, lookback, 1))
    y = np.array(y_list, dtype="float32").reshape((-1, 1))
    return X, y


def build_model(lookback: int = 3) -> "tf.keras.Model":
    if tf is None:
        raise RuntimeError("TensorFlow is not available")
    inp = layers.Input(shape=(lookback, 1))
    x = layers.LSTM(32, return_sequences=False)(inp)
    x = layers.Dense(16, activation="relu")(x)
    out = layers.Dense(1, activation="linear")(x)
    model = models.Model(inp, out)
    model.compile(optimizer="adam", loss="mae")
    return model


def train_and_save(data_dir: str, artifacts_dir: str, lookback: int = 3, epochs: int = 20, batch_size: int = 16) -> dict:
    if tf is None:
        raise RuntimeError("TensorFlow is not available")
    df = _read_csvs(data_dir)
    X, y = _build_sequences(df, lookback=lookback)
    model = build_model(lookback=lookback)
    model.fit(X, y, epochs=epochs, batch_size=batch_size, verbose=0)
    os.makedirs(artifacts_dir, exist_ok=True)
    save_path = os.path.join(artifacts_dir, "tf_model.keras")
    model.save(save_path)
    return {"samples": int(X.shape[0]), "lookback": lookback, "path": save_path}


def load_model(artifacts_dir: str) -> "tf.keras.Model | None":
    if tf is None:
        return None
    path = os.path.join(artifacts_dir, "tf_model.keras")
    if not os.path.isfile(path):
        return None
    return tf.keras.models.load_model(path)


def predict_trajectory(model: "tf.keras.Model | None", start_size: float, months: int = 12, lookback: int = 3) -> List[float]:
    if model is None:
        # caller should fallback
        return []
    # bootstrap with constant start size
    history = [start_size] * lookback
    preds: List[float] = []
    for _ in range(months + 1):
        x = np.array(history[-lookback:], dtype="float32").reshape((1, lookback, 1))
        yhat = float(model.predict(x, verbose=0)[0][0])
        preds.append(max(0.05, yhat))
        history.append(yhat)
    return preds


