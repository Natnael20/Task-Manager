package com.taskManagement.Mapping;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.taskManagement.DTO.TaskDto;
import com.taskManagement.DTO.TaskProgressDto;
import com.taskManagement.Enum.StatusType;
import com.taskManagement.Model.CheckList;
import com.taskManagement.Model.Task;

@Component
public class TaskMapper {

    private final CheckListMapper checkListMapper;
    
    // Constructor injection
    public TaskMapper(CheckListMapper checkListMapper) {
        this.checkListMapper = checkListMapper;
    }

    // DTO → Entity (without checklist items)
    public Task toEntity(TaskDto dto) {
        if (dto == null) return null;
        
        Task task = new Task();
        task.setId(dto.getId());
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setPriority(dto.getPriority());
        task.setDueDate(dto.getDueDate());
        
        // Map checklist items if present
        if (dto.getChecklistItems() != null && !dto.getChecklistItems().isEmpty()) {
            List<CheckList> checklists = dto.getChecklistItems().stream()
                .map(dtoItem -> {
                    CheckList checkList = checkListMapper.toEntity(dtoItem);
                    checkList.setTask(task);
                    return checkList;
                })
                .collect(Collectors.toList());
            task.setChecklistItems(checklists);
        }
        
        // ✅ FIX: Update status based on checklist items
        updateStatus(task);
        
        return task;
    }

    // Entity → DTO (with checklist items)
    public TaskDto toDto(Task entity) {
        if (entity == null) return null;
        
        TaskDto dto = new TaskDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setPriority(entity.getPriority());
        dto.setStatus(entity.getStatus());
        dto.setDueDate(entity.getDueDate());
        
        // Map checklist items if present
        if (entity.getChecklistItems() != null && !entity.getChecklistItems().isEmpty()) {
            dto.setChecklistItems(
                checkListMapper.toDtoList(entity.getChecklistItems())
            );
        }
        
        return dto;
    }

    // Update existing entity from DTO
    public void updateEntity(Task task, TaskDto dto) {
        if (task == null || dto == null) return;
        
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setPriority(dto.getPriority());
        task.setDueDate(dto.getDueDate());
        
        if (dto.getChecklistItems() != null) {
            task.getChecklistItems().clear();
            
            List<CheckList> updatedChecklists = dto.getChecklistItems().stream()
                .map(dtoItem -> {
                    CheckList checkList = checkListMapper.toEntity(dtoItem);
                    checkList.setTask(task);
                    return checkList;
                })
                .collect(Collectors.toList());
            
            task.getChecklistItems().addAll(updatedChecklists);
        }
        
        // ✅ FIX: Update status after updating checklist items
        updateStatus(task);
    }

    // Update task status based on checklist completion
    public void updateStatus(Task task) {
        if (task == null) return;
        
        List<CheckList> items = task.getChecklistItems();
        if (items == null || items.isEmpty()) {
            task.setStatus(StatusType.PENDING);
            return;
        }
        
        long total = items.size();
        long completed = items.stream().filter(CheckList::isCompleted).count();
        
        if (completed == 0) {
            task.setStatus(StatusType.PENDING);
        } else if (completed == total) {
            task.setStatus(StatusType.COMPLETED);
        } else {
            task.setStatus(StatusType.IN_PROGRESS);
        }
    }

    // Convert Task to TaskProgressDto
    public TaskProgressDto toProgressDto(Task task) {
        if (task == null) return null;
        
        TaskProgressDto dto = new TaskProgressDto();
        dto.setTaskId(task.getId());
        dto.setTaskTitle(task.getTitle());
        
        List<CheckList> items = task.getChecklistItems();
        if (items != null && !items.isEmpty()) {
            int total = items.size();
            int completed = (int) items.stream().filter(CheckList::isCompleted).count();
            
            dto.setTotalItems(total);
            dto.setCompletedItems(completed);
            dto.setProgressPercentage((completed * 100) / total);
        } else {
            dto.setTotalItems(0);
            dto.setCompletedItems(0);
            dto.setProgressPercentage(0);
        }
        
        dto.setStatus(task.getStatus() != null ? task.getStatus() : StatusType.PENDING);

        return dto;
    }
}