package com.taskManagement.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistItemDto {
    private Long id;

    @NotBlank(message = "Checklist item cannot be empty")
    private String item;

    private boolean completed;
    
    private Long taskId;

}