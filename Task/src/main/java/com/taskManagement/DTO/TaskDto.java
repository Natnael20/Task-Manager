package com.taskManagement.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.*;

import com.taskManagement.Enum.StatusType;
import com.taskManagement.Enum.PriorityType;

import jakarta.validation.constraints.NotEmpty;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {

    private Long id;
    
    @NotEmpty(message = "Title is required")
    private String title;
    
    private String description;
    
    private PriorityType priority;
    
    private StatusType status;
    
    private Date dueDate;

    private List<ChecklistItemDto> checklistItems;

}