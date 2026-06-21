package com.taskManagement.Mapping;

import org.springframework.stereotype.Component;

import com.taskManagement.Model.Note;
import com.taskManagement.DTO.NoteDto;

@Component
public class NoteMapping {

    public Note toEntity(NoteDto noteDto) {
        Note note = new Note();
        note.setTitle(noteDto.getTitle());
        note.setDescription(noteDto.getDescription());
        note.setDate(noteDto.getDate());
        note.setTime(noteDto.getTime());
        return note;
    }

    public NoteDto toDto(Note note) {
        NoteDto noteDto = new NoteDto();
        noteDto.setId(note.getId());
        noteDto.setTitle(note.getTitle());
        noteDto.setDescription(note.getDescription());
        noteDto.setDate(note.getDate());
        noteDto.setTime(note.getTime());
        return noteDto;
    }
}
