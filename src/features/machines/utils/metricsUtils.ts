import { Machine } from '../../../types';

export const calculateMachineMetrics = (machine: Machine) => {
  let totalWeight = 0;
  let totalPowerConsumption = 0;
  let totalRiskScore = 0;
  let riskFactorCount = 0;

  if (!machine) return { weight: '0g', power: '0W', components: 0, riskScore: '0' };

  machine.components.forEach(component => {
    // Check if specifications exists before accessing its properties
    if (component.specifications) {
      // Extract weight from specifications
      const weightStr = component.specifications.weight as string;
      if (weightStr) {
        const weight = parseFloat(weightStr);
        if (!isNaN(weight)) {
          // Assume weight is in grams if unit is not specified
          if (weightStr.toLowerCase().includes('kg')) {
            totalWeight += weight * 1000;
          } else {
            totalWeight += weight;
          }
        }
      }

      // Calculate power consumption from voltage and current if available
      const voltage = parseFloat(component.specifications.voltage as string || '0');
      const current = parseFloat(component.specifications.current as string || '0');
      if (!isNaN(voltage) && !isNaN(current)) {
        totalPowerConsumption += voltage * current;
      } else if (component.specifications.power) {
        // If power is directly specified
        const power = parseFloat(component.specifications.power as string || '0');
        if (!isNaN(power)) {
          totalPowerConsumption += power;
        }
      }
    }
    
    // Calculate risk score
    if (component.riskFactors && component.riskFactors.length > 0) {
      component.riskFactors.forEach(risk => {
        totalRiskScore += risk.severity * risk.probability;
        riskFactorCount++;
      });
    }
  });

  const avgRiskScore = riskFactorCount > 0 ? totalRiskScore / riskFactorCount : 0;

  return {
    weight: totalWeight > 1000 ? `${(totalWeight / 1000).toFixed(2)} kg` : `${totalWeight.toFixed(2)} g`,
    power: totalPowerConsumption > 1000 ? `${(totalPowerConsumption / 1000).toFixed(2)} kW` : `${totalPowerConsumption.toFixed(2)} W`,
    components: machine.components.length,
    riskScore: avgRiskScore.toFixed(1)
  };
};

export const calculatePerformanceScore = (machine: Machine) => {
  if (!machine) return { score: 0, level: 'Low' };
  
  // Component coverage score - having components from all major categories
  const categories = new Set(machine.components.map(c => c.category));
  const essentialCategories = ['Controller', 'Power', 'Drive'];
  const hasCriticalCategories = essentialCategories.every(cat =>
    machine.components.some(comp => comp.category === cat)
  );
  
  // Calculate base score
  let score = categories.size * 10; // 10 points per category
  
  // Bonus for having all essential categories
  if (hasCriticalCategories) score += 20;
  
  // Adjust score based on component count (optimal range is 4-8)
  const componentCount = machine.components.length;
  if (componentCount >= 4 && componentCount <= 8) {
    score += 10;
  } else if (componentCount > 8) {
    score += 5; // Still good but might be overcomplicated
  }
  
  // Cap at 100
  score = Math.min(100, score);
  
  let level = 'Low';
  if (score >= 80) level = 'Excellent';
  else if (score >= 60) level = 'Good';
  else if (score >= 40) level = 'Average';
  
  return { score, level };
};

export const calculateReliabilityScore = (machine: Machine) => {
  if (!machine) return { score: 0, level: 'Low' };
  
  // Start with base score
  let score = 75; // Assume moderate reliability by default
  
  // Calculate average risk
  let totalRiskScore = 0;
  let riskCount = 0;
  
  machine.components.forEach(component => {
    if (component.riskFactors && component.riskFactors.length > 0) {
      component.riskFactors.forEach(risk => {
        totalRiskScore += risk.severity * risk.probability;
        riskCount++;
      });
    }
  });
  
  // Adjust score based on risks
  if (riskCount > 0) {
    const avgRiskScore = totalRiskScore / riskCount;
    score -= avgRiskScore * 3; // Higher risk reduces reliability
  }
  
  // Bonus for having maintenance schedule
  if (machine.maintenanceSchedule) {
    score += 10;
    
    // Additional bonus for having maintenance tasks
    if (machine.maintenanceSchedule.tasks && machine.maintenanceSchedule.tasks.length > 0) {
      score += Math.min(10, machine.maintenanceSchedule.tasks.length * 2);
    }
  }
  
  // Cap the score at 0-100
  score = Math.max(0, Math.min(100, score));
  
  let level = 'Low';
  if (score >= 80) level = 'Excellent';
  else if (score >= 60) level = 'Good';
  else if (score >= 40) level = 'Average';
  
  return { score, level };
};

export const calculateEfficiencyScore = (machine: Machine) => {
  if (!machine) return { score: 0, level: 'Low' };
  
  // Start with base score
  let score = 70;
  
  // Calculate power efficiency
  let totalPower = 0;
  machine.components.forEach(component => {
    if (component.specifications) {
      // Calculate power from voltage and current if available
      const voltage = parseFloat(component.specifications.voltage as string || '0');
      const current = parseFloat(component.specifications.current as string || '0');
      if (!isNaN(voltage) && !isNaN(current)) {
        totalPower += voltage * current;
      } else if (component.specifications.power) {
        // If power is directly specified
        const power = parseFloat(component.specifications.power as string || '0');
        if (!isNaN(power)) {
          totalPower += power;
        }
      }
    }
  });
  
  // Adjust score based on power consumption (just an example heuristic)
  if (totalPower > 1000) {
    score -= 15; // High power consumption reduces efficiency
  } else if (totalPower < 100) {
    score += 10; // Low power consumption increases efficiency
  }
  
  // Bonus for having software components that might optimize operations
  if (machine.components.some(c => c.category === 'Software')) {
    score += 15;
  }
  
  // Bonus for sensors that might help with adaptive operations
  if (machine.components.some(c => c.category === 'Sensors')) {
    score += 10;
  }
  
  // Cap the score at 0-100
  score = Math.max(0, Math.min(100, score));
  
  let level = 'Low';
  if (score >= 80) level = 'Excellent';
  else if (score >= 60) level = 'Good';
  else if (score >= 40) level = 'Average';
  
  return { score, level };
};