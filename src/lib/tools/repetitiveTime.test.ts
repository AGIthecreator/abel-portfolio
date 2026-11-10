import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LIMITS,
  calculateFromRaw,
  hoursFrom,
  parseBoundedNumber,
  withCost,
} from "./repetitiveTime.ts";

test("valores normales: 5 veces, 15 minutos, 1 persona", () => {
  const figures = hoursFrom(5, 15, 1);
  assert.equal(figures.hoursWeek, 1.25);
  assert.equal(Math.round(figures.hoursMonth * 100) / 100, 5.41);
  assert.equal(figures.hoursYear, 65);
});

test("cero en frecuencia deja el tiempo a cero", () => {
  const figures = hoursFrom(0, 15, 2);
  assert.equal(figures.hoursWeek, 0);
  assert.equal(figures.hoursMonth, 0);
  assert.equal(figures.hoursYear, 0);
});

test("acepta decimales con coma", () => {
  const parsed = parseBoundedNumber("12,5", LIMITS.minutesEach);
  assert.equal(parsed.ok && parsed.value, 12.5);
  const figures = hoursFrom(2, 12.5, 1);
  assert.equal(Math.round(figures.hoursWeek * 100) / 100, 0.42);
});

test("varias personas multiplican el tiempo", () => {
  const figures = hoursFrom(4, 30, 3);
  assert.equal(figures.hoursWeek, 6);
});

test("el coste horario es opcional y no se inventa", () => {
  const without = calculateFromRaw({
    timesPerWeek: "4",
    minutesEach: "30",
    people: "1",
    hourlyCostEur: "",
  });
  assert.equal(without.ok, true);
  if (without.ok) assert.equal(without.figures.costWeekEur, null);
});

test("el coste se calcula solo si hay un importe", () => {
  const figures = withCost(hoursFrom(4, 30, 1), 20);
  assert.equal(figures.hoursWeek, 2);
  assert.equal(figures.costWeekEur, 40);
});

test("rechaza negativos, vacíos y valores excesivos", () => {
  assert.equal(parseBoundedNumber("", 10).ok, false);
  assert.equal(parseBoundedNumber("-3", 10).ok, false);
  assert.equal(parseBoundedNumber("abc", 10).ok, false);
  const tooMany = parseBoundedNumber(String(LIMITS.timesPerWeek + 1), LIMITS.timesPerWeek);
  assert.equal(tooMany.ok, false);
  if (!tooMany.ok) assert.equal(tooMany.reason, "excessive");
});

test("un campo inválido no produce un resultado", () => {
  const result = calculateFromRaw({
    timesPerWeek: "-1",
    minutesEach: "10",
    people: "1",
    hourlyCostEur: "9999",
  });
  assert.equal(result.ok, false);
});
