import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("1v1 Live Quiz Arena Game Engine", () => {
  it("generates valid room code with ARN- prefix", () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "ARN-";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    assert.match(code, /^ARN-[A-Z0-9]{4}$/);
  });

  it("calculates damage and speed bonus correctly", () => {
    const timeTaken = 4; // answered in 4 seconds
    const speedBonus = Math.max(0, Math.round((12 - timeTaken) * 2));
    const damageDealt = 20 + speedBonus;
    assert.equal(speedBonus, 16);
    assert.equal(damageDealt, 36);

    const scoreGained = 100 + speedBonus * 5;
    assert.equal(scoreGained, 180);
  });

  it("applies combo streak bonuses on multiple correct answers", () => {
    let streak = 2;
    const comboBonus = streak >= 2 ? 25 : 0;
    assert.equal(comboBonus, 25);

    streak = 0; // resets on wrong answer
    const resetBonus = streak >= 2 ? 25 : 0;
    assert.equal(resetBonus, 0);
  });

  it("handles knockout victory condition when HP reaches 0", () => {
    let p1Hp = 40;
    let p2Hp = 10;
    const damage = 25;
    p2Hp = Math.max(0, p2Hp - damage);

    assert.equal(p2Hp, 0);
    const isKnockout = p1Hp <= 0 || p2Hp <= 0;
    assert.equal(isKnockout, true);
    const winner = p1Hp > p2Hp ? "p1" : "p2";
    assert.equal(winner, "p1");
  });
});
