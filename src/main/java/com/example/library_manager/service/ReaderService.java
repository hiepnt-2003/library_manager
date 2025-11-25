package com.example.library_manager.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.library_manager.model.Reader;
import com.example.library_manager.model.User;
import com.example.library_manager.repository.ReaderRepository;
import com.example.library_manager.repository.UserRepository;

@Service
public class ReaderService {
    @Autowired
    private ReaderRepository readerRepository;
    @Autowired
    private UserRepository userRepository;

    public List<Reader> getAllReaders() {
        List<Reader> readers = readerRepository.findAll();

        for (Reader reader : readers) {
            Optional<User> userOpt = userRepository.findById(reader.getUserId());
            userOpt.ifPresent(user -> {
                reader.setUsername(user.getUsername());
                reader.setPassword(user.getPassword());
                reader.setFullName(user.getFullName());
                reader.setPhone(user.getPhone());
                reader.setIsActive(user.getIsActive());

                // Nếu thẻ quá hạn thì isActive = 0 và lưu vào db user.isActive = 0
                if (reader.getMembershipExpiryDate() != null
                        && reader.getMembershipExpiryDate().before(new java.util.Date())) {
                    reader.setIsActive(0);
                    user.setIsActive(0);
                    userRepository.save(user);
                }
            });
        }
        return readers;
    }

    public Optional<Reader> getReaderById(Integer id) {
        Reader reader = readerRepository.findById(id).orElse(null);
        if (reader != null) {
            Optional<User> userOpt = userRepository.findById(reader.getUserId());
            userOpt.ifPresent(user -> {
                reader.setUsername(user.getUsername());
                reader.setPassword(user.getPassword());
                reader.setFullName(user.getFullName());
                reader.setPhone(user.getPhone());
                reader.setIsActive(user.getIsActive());

                // Nếu thẻ quá hạn thì isActive = 0 và lưu vào db user.isActive = 0
                if (reader.getMembershipExpiryDate() != null
                        && reader.getMembershipExpiryDate().before(new java.util.Date())) {
                    reader.setIsActive(0);
                    user.setIsActive(0);
                    userRepository.save(user);
                }
            });
        }
        return Optional.ofNullable(reader);
    }

    public Reader addReader(Reader reader) {
        Optional<User> userOpt = userRepository.findByUsername(reader.getUsername());
        if (userOpt.isPresent()) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }
        // Tạo mới user trước
        User user = new User(reader.getUsername(),
                reader.getPassword(),
                reader.getFullName(),
                reader.getPhone(),
                com.example.library_manager.model.enums.UserType.READER);
        User savedUser = userRepository.save(user);

        // Gán userId cho reader rồi lưu reader
        reader.setUserId(savedUser.getId());
        reader.setLibraryCardNumber("LIB" + (readerRepository.count() + 1));
        Reader savedReader = readerRepository.save(reader);
        return savedReader;
    }

    public Reader updateReader(Reader reader) {
        Reader savedReader = readerRepository.save(reader);
        Optional<User> userOpt = userRepository.findById(savedReader.getUserId());
        userOpt.ifPresent(user -> {
            user.setIsActive(savedReader.getIsActive());
            userRepository.save(user);
        });
        return savedReader;
    }
}
