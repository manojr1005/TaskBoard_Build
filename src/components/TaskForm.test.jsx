
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import TaskForm from "./TaskForm";

afterEach(() => {
  cleanup();
});

describe("TaskForm validation", () => {
  it("shows an error for a title shorter than 5 characters", () => {
    const onSubmit = vi.fn();

    render(<TaskForm users={[]} onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Hey" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create task" }));

    expect(screen.getByRole("alert").textContent).toContain(
      "Title must be between 5 and 120 characters."
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("trims whitespace from a valid title", () => {
    const onSubmit = vi.fn();

    render(<TaskForm users={[]} onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "  Fix task board  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create task" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Fix task board" })
    );
  });
});
