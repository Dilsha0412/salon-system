package com.salon.auth.service;

import com.salon.auth.dto.AuthResponse;
import com.salon.auth.dto.LoginRequest;
import com.salon.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
