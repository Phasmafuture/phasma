export interface MetricsSeries {
  reward: number[];
  loss: number[];
  successRate: number[];
  policy1: number[];
  policy2: number[];
}

export function generateDemoSeries(episodes: number): MetricsSeries {
  const reward: number[] = [];
  const loss: number[] = [];
  const successRate: number[] = [];
  const policy1: number[] = [];
  const policy2: number[] = [];

  // Seed for deterministic generation
  let rewardBase = -50;
  let lossBase = 2.5;
  let successBase = 10;
  let policy1Base = 20;
  let policy2Base = 15;

  for (let i = 0; i < episodes; i++) {
    const _progress = i / episodes;

    // Reward: starts negative, improves with noise
    rewardBase += 0.15 + Math.random() * 0.1 - 0.05;
    reward.push(rewardBase + (Math.random() - 0.5) * 5);

    // Loss: starts high, decreases with noise
    lossBase *= 0.9985;
    loss.push(Math.max(0.1, lossBase + (Math.random() - 0.5) * 0.2));

    // Success rate: starts low, increases to ~90%
    successBase += (90 - successBase) * 0.003 + (Math.random() - 0.5) * 2;
    successRate.push(Math.max(0, Math.min(100, successBase)));

    // Policy 1: steady improvement
    policy1Base += 0.08 + Math.random() * 0.05;
    policy1.push(policy1Base + (Math.random() - 0.5) * 3);

    // Policy 2: slower improvement, more variance
    policy2Base += 0.06 + Math.random() * 0.08;
    policy2.push(policy2Base + (Math.random() - 0.5) * 4);
  }

  return { reward, loss, successRate, policy1, policy2 };
}
