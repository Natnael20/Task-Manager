package com.taskManagement.ServiceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.taskManagement.Model.Note;
import com.taskManagement.DTO.NoteDto;
import com.taskManagement.DTO.MessageDto;
import com.taskManagement.Mapping.NoteMapping;
import com.taskManagement.Repository.NoteRepository;
import com.taskManagement.Service.NoteService;

import lombok.RequiredArgsConstructor;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepo;
    private final NoteMapping noteMapping;

    @Override
    public List<NoteDto> getAllNotes() {
        List<Note> notes = noteRepo.findAll();
            return notes.stream()
                .map(noteMapping::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public NoteDto getNote(long id) {
        Optional<Note> noteOpt = noteRepo.findById(id);
        if (noteOpt.isPresent()) {
            return noteMapping.toDto(noteOpt.get());
        }
        return null;
    }

    @Override
    public NoteDto createNote(NoteDto noteDto) {
        Note newNote = noteMapping.toEntity(noteDto);
        Note saveNote = noteRepo.save(newNote);
        return noteMapping.toDto(saveNote);
    }

    @Override
    public MessageDto deleteNote(long id) {
        Note note = noteRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Note not found"));

        noteRepo.delete(note);
        return new MessageDto(true, "Note is successfully deleted");
    }

}
