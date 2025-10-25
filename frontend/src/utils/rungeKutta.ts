// F:\Diagnosis\frontend\src\utils\rungeKutta.ts
export interface RKResult {
  time: number[];
  severity: number[];
}

export const rungeKutta = (
  initialSeverity: number,
  k: number = 0.1,
  Smax: number = 100,
  tMax: number = 10,
  dt: number = 0.1
): RKResult => {
  const time: number[] = [];
  const severity: number[] = [];
  let S = initialSeverity;
  let t = 0;

  // Équation différentielle : dS/dt = k * S * (1 - S/Smax)
  const dSdt = (S: number): number => k * S * (1 - S / Smax);

  while (t <= tMax) {
    time.push(t);
    severity.push(S);

    // Coefficients RK4
    const k1 = dSdt(S);
    const k2 = dSdt(S + (dt * k1) / 2);
    const k3 = dSdt(S + (dt * k2) / 2);
    const k4 = dSdt(S + dt * k3);

    // Mise à jour de S
    S += (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    t += dt;
  }

  return { time, severity };
};