package com.taskManagement.Service;

import java.util.List;

import com.taskManagement.DTO.MessageDto;
import com.taskManagement.DTO.NoteDto;

public interface NoteService {

    List<NoteDto> getAllNotes();
    NoteDto getNote(long id);
    NoteDto createNote(NoteDto noteDto);
    MessageDto deleteNote(long id);

}
