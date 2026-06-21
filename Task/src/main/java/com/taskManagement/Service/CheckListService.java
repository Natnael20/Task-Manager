package com.taskManagement.Service;

import com.taskManagement.DTO.ChecklistItemDto;
import com.taskManagement.DTO.MessageDto;
import com.taskManagement.DTO.TaskProgressDto;

public interface CheckListService {

    TaskProgressDto toggleChecklistItem(Long taskId, Long checklistId);
    TaskProgressDto getTaskProgress(Long taskId);
    //ChecklistItemDto createCheckList(ChecklistItemDto itemDto);
    //essageDto updateChecklist(Long id, Long TaskId, ChecklistItemDto checklistDto);
    //MessageDto deleteCheckList(Long id, Long Taskid);
}
