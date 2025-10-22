import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import random

@dataclass
class PatientState:
    """Patient state representation for RL"""
    tumor_size: float
    age: int
    stage: str
    treatment_history: List[str]
    months_elapsed: int
    qol_score: float = 0.5  # Quality of Life (0-1)
    toxicity_level: float = 0.0  # Treatment toxicity (0-1)
    resistance_risk: float = 0.0  # Drug resistance risk (0-1)

@dataclass
class TreatmentAction:
    """Treatment action for RL"""
    treatment_type: str  # 'chemo', 'radiation', 'combined', 'none'
    intensity: float  # 0.0 to 1.0
    duration_months: int

class TumorRLAgent:
    """Reinforcement Learning Agent for tumor treatment optimization"""
    
    def __init__(self, learning_rate: float = 0.1, discount_factor: float = 0.95):
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor
        self.q_table = {}  # State-action value table
        self.epsilon = 0.1  # Exploration rate
        self.epsilon_decay = 0.995
        self.min_epsilon = 0.01
        
    def _state_to_key(self, state: PatientState) -> str:
        """Convert patient state to Q-table key"""
        # Discretize continuous values for Q-table
        size_bucket = round(state.tumor_size, 1)
        age_bucket = (state.age // 10) * 10
        qol_bucket = round(state.qol_score, 1)
        toxicity_bucket = round(state.toxicity_level, 1)
        
        return f"{size_bucket}_{age_bucket}_{state.stage}_{qol_bucket}_{toxicity_bucket}_{state.months_elapsed}"
    
    def _action_to_key(self, action: TreatmentAction) -> str:
        """Convert action to Q-table key"""
        intensity_bucket = round(action.intensity, 1)
        return f"{action.treatment_type}_{intensity_bucket}_{action.duration_months}"
    
    def compute_reward(self, prev_state: PatientState, new_state: PatientState, 
                      action: TreatmentAction, final_outcome: bool = False) -> float:
        """Compute reward based on clinical outcomes"""
        reward = 0.0
        
        # Key Metrics - Rewards
        # +10 for significant tumor reduction
        size_reduction = prev_state.tumor_size - new_state.tumor_size
        if size_reduction > 0.5:  # Significant reduction
            reward += 10.0
        elif size_reduction > 0.1:  # Moderate reduction
            reward += 5.0
        
        # +5 for QoL improvement
        qol_improvement = new_state.qol_score - prev_state.qol_score
        if qol_improvement > 0.1:
            reward += 5.0
        
        # +100 for successful final state (5-year disease-free survival)
        if final_outcome and new_state.tumor_size < 0.5 and new_state.months_elapsed >= 60:
            reward += 100.0
        
        # Key Metrics - Penalties
        # -20 for tumor progression
        if size_reduction < -0.2:  # Tumor grew
            reward -= 20.0
        
        # -5 for severe adverse events or high toxicity
        if new_state.toxicity_level > 0.8:
            reward -= 5.0
        
        # -50 for drug-resistant tumor sub-clone emergence
        if new_state.resistance_risk > 0.7:
            reward -= 50.0
        
        # Additional clinical penalties
        # -10 for treatment discontinuation due to toxicity
        if new_state.toxicity_level > 0.9:
            reward -= 10.0
        
        # -15 for metastasis (simplified as stage progression)
        if new_state.stage in ['T4', 'M1'] and prev_state.stage not in ['T4', 'M1']:
            reward -= 15.0
        
        return reward
    
    def get_action(self, state: PatientState, training: bool = True) -> TreatmentAction:
        """Get action using epsilon-greedy policy"""
        state_key = self._state_to_key(state)
        
        if training and random.random() < self.epsilon:
            # Exploration: random action
            return self._random_action()
        
        # Exploitation: best known action
        if state_key not in self.q_table:
            self.q_table[state_key] = {}
        
        best_action = None
        best_value = float('-inf')
        
        for action in self._get_possible_actions(state):
            action_key = self._action_to_key(action)
            value = self.q_table[state_key].get(action_key, 0.0)
            if value > best_value:
                best_value = value
                best_action = action
        
        return best_action or self._random_action()
    
    def _random_action(self) -> TreatmentAction:
        """Generate random treatment action"""
        treatment_types = ['chemo', 'radiation', 'combined', 'none']
        treatment_type = random.choice(treatment_types)
        intensity = random.uniform(0.3, 1.0) if treatment_type != 'none' else 0.0
        duration = random.randint(1, 6) if treatment_type != 'none' else 0
        
        return TreatmentAction(
            treatment_type=treatment_type,
            intensity=intensity,
            duration_months=duration
        )
    
    def _get_possible_actions(self, state: PatientState) -> List[TreatmentAction]:
        """Get possible actions for given state"""
        actions = []
        
        # Treatment options based on patient state
        if state.toxicity_level < 0.7:  # Can tolerate treatment
            actions.extend([
                TreatmentAction('chemo', 0.8, 3),
                TreatmentAction('radiation', 0.7, 2),
                TreatmentAction('combined', 0.6, 4),
            ])
        
        if state.tumor_size < 1.0:  # Small tumor - less aggressive needed
            actions.extend([
                TreatmentAction('chemo', 0.5, 2),
                TreatmentAction('radiation', 0.6, 1),
            ])
        
        # Always include no treatment option
        actions.append(TreatmentAction('none', 0.0, 0))
        
        return actions
    
    def update_q_value(self, state: PatientState, action: TreatmentAction, 
                      reward: float, next_state: PatientState):
        """Update Q-value using Q-learning"""
        state_key = self._state_to_key(state)
        action_key = self._action_to_key(action)
        next_state_key = self._state_to_key(next_state)
        
        if state_key not in self.q_table:
            self.q_table[state_key] = {}
        
        # Get current Q-value
        current_q = self.q_table[state_key].get(action_key, 0.0)
        
        # Get max Q-value for next state
        if next_state_key in self.q_table:
            max_next_q = max(self.q_table[next_state_key].values()) if self.q_table[next_state_key] else 0.0
        else:
            max_next_q = 0.0
        
        # Q-learning update
        new_q = current_q + self.learning_rate * (reward + self.discount_factor * max_next_q - current_q)
        self.q_table[state_key][action_key] = new_q
    
    def decay_epsilon(self):
        """Decay exploration rate"""
        self.epsilon = max(self.min_epsilon, self.epsilon * self.epsilon_decay)
    
    def simulate_treatment_episode(self, initial_state: PatientState, 
                                 max_months: int = 24) -> Tuple[List[float], List[TreatmentAction]]:
        """Simulate a complete treatment episode"""
        rewards = []
        actions_taken = []
        current_state = initial_state
        
        for month in range(max_months):
            # Get action from policy
            action = self.get_action(current_state, training=True)
            actions_taken.append(action)
            
            # Simulate treatment effect
            new_state = self._simulate_treatment_effect(current_state, action)
            
            # Compute reward
            reward = self.compute_reward(current_state, new_state, action)
            rewards.append(reward)
            
            # Update Q-value
            self.update_q_value(current_state, action, reward, new_state)
            
            # Check termination conditions
            if new_state.tumor_size < 0.1:  # Tumor eliminated
                break
            if new_state.toxicity_level > 0.9:  # Too toxic
                break
            if new_state.months_elapsed >= max_months:  # Max time reached
                break
            
            current_state = new_state
        
        return rewards, actions_taken
    
    def _simulate_treatment_effect(self, state: PatientState, action: TreatmentAction) -> PatientState:
        """Simulate the effect of treatment on patient state"""
        new_state = PatientState(
            tumor_size=state.tumor_size,
            age=state.age,
            stage=state.stage,
            treatment_history=state.treatment_history + [action.treatment_type],
            months_elapsed=state.months_elapsed + 1,
            qol_score=state.qol_score,
            toxicity_level=state.toxicity_level,
            resistance_risk=state.resistance_risk
        )
        
        # Treatment effects
        if action.treatment_type == 'chemo':
            # Chemotherapy reduces tumor but increases toxicity
            tumor_reduction = action.intensity * 0.3
            new_state.tumor_size = max(0.1, state.tumor_size - tumor_reduction)
            new_state.toxicity_level = min(1.0, state.toxicity_level + action.intensity * 0.2)
            new_state.qol_score = max(0.0, state.qol_score - action.intensity * 0.1)
            
        elif action.treatment_type == 'radiation':
            # Radiation is more targeted
            tumor_reduction = action.intensity * 0.4
            new_state.tumor_size = max(0.1, state.tumor_size - tumor_reduction)
            new_state.toxicity_level = min(1.0, state.toxicity_level + action.intensity * 0.15)
            new_state.qol_score = max(0.0, state.qol_score - action.intensity * 0.05)
            
        elif action.treatment_type == 'combined':
            # Combined therapy is most effective but most toxic
            tumor_reduction = action.intensity * 0.5
            new_state.tumor_size = max(0.1, state.tumor_size - tumor_reduction)
            new_state.toxicity_level = min(1.0, state.toxicity_level + action.intensity * 0.3)
            new_state.qol_score = max(0.0, state.qol_score - action.intensity * 0.2)
            
        else:  # No treatment
            # Tumor may grow without treatment
            tumor_growth = random.uniform(0.0, 0.1)
            new_state.tumor_size = min(10.0, state.tumor_size + tumor_growth)
            new_state.toxicity_level = max(0.0, state.toxicity_level - 0.05)  # Recovery
            new_state.qol_score = min(1.0, state.qol_score + 0.05)  # Recovery
        
        # Resistance development
        if len(new_state.treatment_history) > 3:
            new_state.resistance_risk = min(1.0, state.resistance_risk + 0.05)
        
        return new_state
    
    def get_optimal_treatment_plan(self, initial_state: PatientState, 
                                 horizon_months: int = 12) -> List[TreatmentAction]:
        """Get optimal treatment plan for given patient"""
        plan = []
        current_state = initial_state
        
        for month in range(horizon_months):
            action = self.get_action(current_state, training=False)
            plan.append(action)
            current_state = self._simulate_treatment_effect(current_state, action)
            
            # Early termination if tumor eliminated
            if current_state.tumor_size < 0.1:
                break
        
        return plan
