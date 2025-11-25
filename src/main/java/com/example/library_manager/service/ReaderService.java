package com.example.library_manager.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.library_manager.model.Reader;
import com.example.library_manager.model.User;
import com.example.library_manager.repository.ReaderRepository;
import com.example.library_manager.repository.UserRepository;

import jakarta.transaction.Transactional;

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


    @Transactional
    public Reader addReader(Reader reader) {
        List<User> users = userRepository.findByUsername(reader.getUsername());
        if (!users.isEmpty()) {
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

    @Transactional
    public Reader updateReader(Reader reader) {
        // Lấy reader hiện tại từ database
        Reader existingReader = readerRepository.findById(reader.getId())
                .orElseThrow(() -> new IllegalArgumentException("Reader không tồn tại"));
        
        // Cập nhật Reader table
        existingReader.setMembershipExpiryDate(reader.getMembershipExpiryDate());
        Reader savedReader = readerRepository.save(existingReader);
        
        // Cập nhật User table
        Optional<User> userOpt = userRepository.findById(existingReader.getUserId());
        userOpt.ifPresent(user -> {
            // Cập nhật các trường từ transient fields của reader
            if (reader.getPassword() != null && !reader.getPassword().isEmpty()) {
                user.setPassword(reader.getPassword());
            }
            if (reader.getFullName() != null && !reader.getFullName().isEmpty()) {
                user.setFullName(reader.getFullName());
            }
            if (reader.getPhone() != null && !reader.getPhone().isEmpty()) {
                user.setPhone(reader.getPhone());
            }
            if (reader.getIsActive() != null) {
                user.setIsActive(reader.getIsActive());
            }
            userRepository.save(user);
        });
        
        return savedReader;
    }
}
