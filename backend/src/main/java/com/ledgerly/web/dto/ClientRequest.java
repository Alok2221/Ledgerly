package com.ledgerly.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClientRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 20) String nip,
        @Email @Size(max = 120) String email,
        @Size(max = 40) String phone,
        @Size(max = 300) String address) {}
