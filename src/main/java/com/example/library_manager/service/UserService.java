package com.example.library_manager.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.library_manager.model.User;
import com.example.library_manager.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    //  Lấy danh sách tất cả người dùng
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Lấy người dùng theo ID
    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }

    // Lấy người dùng theo username
    public List<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // Thêm người dùng mới
    public User addUser(User user) {
        user.setIsActive(1);
        return userRepository.save(user);
    }

    // Cập nhật thông tin người dùng
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    // Vô hiệu hóa người dùng
    public void disableUser(Integer id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setIsActive(0);
            userRepository.save(user);
        });
    }
}
