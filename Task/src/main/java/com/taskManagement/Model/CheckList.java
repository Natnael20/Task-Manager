package com.taskManagement.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "checklist_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Checklist item cannot be empty")
    @Column(name = "item", nullable = false, length = 255)
    private String item;

    @Column(name = "is_completed", nullable = false)
    private boolean completed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @JsonIgnore  // Prevents infinite recursion during JSON serialization
    private Task task;

    // Convenience constructor
    public CheckList(String item, Task task) {
        this.item = item;
        this.task = task;
        this.completed = false;
    }

    // Convenience constructor with completed status
    public CheckList(String item, Task task, boolean completed) {
        this.item = item;
        this.task = task;
        this.completed = completed;
    }
}