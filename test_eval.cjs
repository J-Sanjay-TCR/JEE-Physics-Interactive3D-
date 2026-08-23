// Quick check of projectile logic simulation
const u = 20, theta = 30, g = 9.8, h0 = 10, planeAngle = -15;
const rad = (theta * Math.PI) / 180;
const alpha = (planeAngle * Math.PI) / 180;

let t = 0, x = 0, y = h0;
let vx = u * Math.cos(rad);
let vy = u * Math.sin(rad);
const dt = 0.01;
let bounces = 0;
let isBouncing = false;

while(t < 5 && x < 85 && bounces < 4) {
    t += dt;
    x += vx * dt;
    y += vy * dt - 0.5 * g * dt * dt;
    vy -= g * dt;
    
    const planeY = x * Math.tan(alpha);
    
    let bounce = false;
    if (y <= planeY && !isBouncing) {
      y = planeY;
      const v_n = -vx * Math.sin(alpha) + vy * Math.cos(alpha);
      const v_p = vx * Math.cos(alpha) + vy * Math.sin(alpha);
      
      if (v_n < 0 && Math.abs(v_n) < 0.5) {
        isBouncing = true;
      } else if (v_n < 0) {
        const e = 0.55; 
        const v_n_new = -v_n * e;
        const v_p_new = v_p * 0.85; 
        vx = v_p_new * Math.cos(alpha) - v_n_new * Math.sin(alpha);
        vy = v_p_new * Math.sin(alpha) + v_n_new * Math.cos(alpha);
        bounce = true;
        bounces++;
      }
    }
    if (y > planeY + 0.1) isBouncing = false;
}
console.log("Ended at", t, x, y, bounces);
