package com.taskManagement.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskManagement.DTO.NoteDto;
import com.taskManagement.DTO.MessageDto;
import com.taskManagement.ServiceImpl.NoteServiceImpl;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteServiceImpl noteService;

    @GetMapping("/all")
    public List<NoteDto> getAllNotes() {
        return noteService.getAllNotes();
    }

    @GetMapping("/{id}")
    public NoteDto getNote(@PathVariable("id") long id) {
        return noteService.getNote(id);
    }

    @PostMapping("/create")
    public NoteDto create(@Valid @RequestBody NoteDto noteDto) {
        return noteService.createNote(noteDto);
    }

    @DeleteMapping("/{id}")
    public MessageDto delete(@PathVariable long id) {
        return noteService.deleteNote(id);
    }

}
