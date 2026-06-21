package com.taskManagement.DTO;

import com.taskManagement.Enum.StatusType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskProgressDto {
    private Long taskId;
    private String taskTitle;
    private int totalItems;
    private int completedItems;
    private int progressPercentage;
    private StatusType status;
}