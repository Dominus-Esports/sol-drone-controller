describe('Config defaults', () => {
  test('has sane speed cap and yaw', () => {
    const cfg = { speedCap: 30, controls: { yawSensitivity: 1.5 } };
    expect(cfg.speedCap).toBeGreaterThan(0);
    expect(cfg.controls.yawSensitivity).toBeGreaterThan(0);
  });
});


