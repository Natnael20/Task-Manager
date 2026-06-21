package com.taskManagement.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.taskManagement.DTO.TaskProgressDto;
import com.taskManagement.ServiceImpl.ChecklistServiceImpl;

@RestController
@RequestMapping("/api/checklists")
public class CheckListController {

    @Autowired
    private ChecklistServiceImpl checkListService;

    @PutMapping("/task/{taskId}/item/{checklistId}/toggle")
    public ResponseEntity<TaskProgressDto> toggleChecklistItem(@PathVariable Long taskId, @PathVariable Long checklistId) {
        TaskProgressDto progress = checkListService.toggleChecklistItem(taskId, checklistId);
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/task/{taskId}/progress")
    public ResponseEntity<TaskProgressDto> getTaskProgress(@PathVariable Long taskId) {
        TaskProgressDto progress = checkListService.getTaskProgress(taskId);
        return ResponseEntity.ok(progress);
    }
}