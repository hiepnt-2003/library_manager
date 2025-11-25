package com.example.library_manager.service;

import com.example.library_manager.model.Reader;
import com.example.library_manager.repository.ReaderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReaderService {
    @Autowired
    private ReaderRepository readerRepository;

    public List<Reader> getAllReaders() {
        return readerRepository.findAll();
    }

    public Optional<Reader> getReaderById(Integer id) {
        return readerRepository.findById(id);
    }

    public Reader addReader(Reader reader) {
        return readerRepository.save(reader);
    }

    public Reader updateReader(Reader reader) {
        return readerRepository.save(reader);
    }
}
