package com.taskManagement.Mapping;

import org.springframework.stereotype.Component;
import com.taskManagement.DTO.ChecklistItemDto;
import com.taskManagement.Model.CheckList;
import com.taskManagement.Model.Task;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CheckListMapper {
    
    // DTO → Entity
    public CheckList toEntity(ChecklistItemDto dto) {
        if (dto == null) {
            return null;
        }
        
        CheckList checklist = new CheckList();
        checklist.setId(dto.getId());
        checklist.setItem(dto.getItem());
        checklist.setCompleted(dto.isCompleted());
        return checklist;
    }
    
    // Entity → DTO
    public ChecklistItemDto toDto(CheckList checklist) {
        if (checklist == null) {
            return null;
        }
        
        return new ChecklistItemDto(
            checklist.getId(),
            checklist.getItem(),
            checklist.isCompleted(),
            checklist.getTask() != null ? checklist.getTask().getId() : null
        );
    }
    
                                           
    
    public List<ChecklistItemDto> toDtoList(List<CheckList> checklists) {
        if (checklists == null) {
            return null;   
        }
        
        return checklists.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }
    
    public void updateEntity(ChecklistItemDto dto, CheckList checklist) {
        if (dto == null || checklist == null) {
            return;
        }
        
        checklist.setItem(dto.getItem());
        checklist.setCompleted(dto.isCompleted());
    }
}