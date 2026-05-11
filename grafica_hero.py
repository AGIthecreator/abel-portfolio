#!/usr/bin/env python3
"""
Visualización editorial minimalista para la sección Hero.
Dos series: eficiencia (12 h → +1 800 €) e ineficiencia (47 h → −2 400 €).
Salida: hero_stats.png (300 DPI, fondo transparente).
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import matplotlib.pyplot as plt

try:
    from scipy.interpolate import make_interp_spline
except ImportError:
    make_interp_spline = None  # type: ignore[misc, assignment]

# --- Paleta editorial ---
COLOR_GAIN = "#2D5A27"  # verde esmeralda suave
COLOR_LOSS = "#C66B5A"  # coral terracota
TEXT = "#F5F5F5"  # blanco roto
GRID = (0.92, 0.92, 0.92, 0.22)  # gris muy sutil (RGBA sobre transparente)


def smooth_organic(x: np.ndarray, y: np.ndarray, n_out: int = 220) -> tuple[np.ndarray, np.ndarray]:
    """Curva suave a través de puntos ancla (spline SciPy o suavizado solo NumPy)."""
    t = np.linspace(float(x.min()), float(x.max()), n_out)
    if make_interp_spline is not None and len(x) >= 4:
        k = min(3, len(x) - 1)
        spl = make_interp_spline(x, y, k=k)
        return t, spl(t)
    # Fallback sin SciPy: interpolación lineal densa + media móvil (curva orgánica suave)
    y_lin = np.interp(t, x, y)
    k = max(5, n_out // 40, 1)
    kernel = np.ones(k, dtype=float) / float(k)
    pad = k // 2
    y_pad = np.pad(y_lin, (pad, pad), mode="edge")
    y_s = np.convolve(y_pad, kernel, mode="valid")
    return t, y_s.astype(float)


def plot_panel(ax, x_raw: np.ndarray, y_raw: np.ndarray, color: str, title: str, subtitle: str) -> None:
    xs, ys = smooth_organic(x_raw, y_raw)
    ax.plot(xs, ys, color=color, linewidth=2.15, solid_capstyle="round", solid_joinstyle="round", antialiased=True)

    for spine in ax.spines.values():
        spine.set_visible(False)

    ax.tick_params(axis="both", which="both", length=0, labelsize=8, colors=TEXT, pad=6)
    ax.set_facecolor("none")
    ax.grid(True, linestyle="-", linewidth=0.55, color=GRID, which="major")
    ax.set_axisbelow(True)

    ax.set_title(title, fontsize=11, fontweight="500", color=TEXT, pad=14, loc="left")
    ax.text(
        0.0,
        1.02,
        subtitle,
        transform=ax.transAxes,
        fontsize=8.5,
        color=TEXT,
        alpha=0.72,
        ha="left",
        va="bottom",
    )


def main() -> None:
    # Tipografía: sans preferida; fallback del sistema
    plt.rcParams.update(
        {
            "font.family": "sans-serif",
            "font.sans-serif": ["Inter", "Helvetica Neue", "Arial", "DejaVu Sans"],
            "axes.unicode_minus": False,
        }
    )

    # --- Gráfica 1: eficiencia (ascendente orgánica), 12 h → +1 800 € ---
    x_gain = np.array([0.0, 2.5, 5.0, 8.0, 12.0], dtype=float)
    y_gain = np.array([0.0, 280.0, 620.0, 1150.0, 1800.0], dtype=float)

    # --- Gráfica 2: ineficiencia (descendente orgánica), 47 h → −2 400 € ---
    x_loss = np.array([0.0, 10.0, 22.0, 34.0, 47.0], dtype=float)
    y_loss = np.array([0.0, -320.0, -900.0, -1650.0, -2400.0], dtype=float)

    fig, axes = plt.subplots(
        1,
        2,
        figsize=(10.2, 4.1),
        dpi=300,
        facecolor="none",
    )
    fig.patch.set_alpha(0.0)

    plot_panel(
        axes[0],
        x_gain,
        y_gain,
        COLOR_GAIN,
        "Eficiencia",
        "12 h de trabajo  ·  +1 800 €",
    )
    axes[0].set_xlabel("Horas", fontsize=8, color=TEXT, alpha=0.75, labelpad=8)
    axes[0].set_ylabel("Beneficio (€)", fontsize=8, color=TEXT, alpha=0.75, labelpad=8)

    plot_panel(
        axes[1],
        x_loss,
        y_loss,
        COLOR_LOSS,
        "Ineficiencia",
        "47 h de trabajo  ·  −2 400 €",
    )
    axes[1].set_xlabel("Horas", fontsize=8, color=TEXT, alpha=0.75, labelpad=8)
    axes[1].set_ylabel("Resultado (€)", fontsize=8, color=TEXT, alpha=0.75, labelpad=8)

    plt.subplots_adjust(left=0.08, right=0.98, top=0.82, bottom=0.18, wspace=0.34)

    root = Path(__file__).resolve().parent
    out_root = root / "hero_stats.png"
    out_public = root / "public" / "hero_stats.png"
    for out in (out_root, out_public):
        out.parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(out, dpi=300, transparent=True, bbox_inches="tight", pad_inches=0.08)
    plt.close(fig)
    print(f"Guardado: {out_root}")
    print(f"Guardado: {out_public}")


if __name__ == "__main__":
    main()
