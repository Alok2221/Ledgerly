package com.ledgerly.service;

import com.ledgerly.domain.Client;
import com.ledgerly.domain.User;
import com.ledgerly.exception.NotFoundException;
import com.ledgerly.repository.ClientRepository;
import com.ledgerly.repository.UserRepository;
import com.ledgerly.web.dto.ClientRequest;
import com.ledgerly.web.dto.ClientResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    public ClientService(ClientRepository clientRepository, UserRepository userRepository) {
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ClientResponse> list(UUID ownerId, String query) {
        List<Client> clients = StringUtils.hasText(query)
                ? clientRepository.searchByOwnerAndName(ownerId, query.trim())
                : clientRepository.findByOwnerIdOrderByNameAsc(ownerId);
        return clients.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ClientResponse get(UUID ownerId, UUID clientId) {
        return toResponse(requireOwned(ownerId, clientId));
    }

    @Transactional
    public ClientResponse create(UUID ownerId, ClientRequest request) {
        User owner = userRepository.findById(ownerId).orElseThrow(() -> new NotFoundException("User not found"));
        Client client = new Client();
        client.setOwner(owner);
        apply(client, request);
        return toResponse(clientRepository.save(client));
    }

    @Transactional
    public ClientResponse update(UUID ownerId, UUID clientId, ClientRequest request) {
        Client client = requireOwned(ownerId, clientId);
        apply(client, request);
        return toResponse(client);
    }

    @Transactional
    public void delete(UUID ownerId, UUID clientId) {
        Client client = requireOwned(ownerId, clientId);
        clientRepository.delete(client);
    }

    public Client requireOwned(UUID ownerId, UUID clientId) {
        return clientRepository
                .findByIdAndOwnerId(clientId, ownerId)
                .orElseThrow(() -> new NotFoundException("Client not found"));
    }

    private void apply(Client client, ClientRequest request) {
        client.setName(request.name().trim());
        client.setNip(blankToNull(request.nip()));
        client.setEmail(blankToNull(request.email()));
        client.setPhone(blankToNull(request.phone()));
        client.setAddress(blankToNull(request.address()));
    }

    private String blankToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private ClientResponse toResponse(Client client) {
        return new ClientResponse(
                client.getId(),
                client.getName(),
                client.getNip(),
                client.getEmail(),
                client.getPhone(),
                client.getAddress(),
                client.getCreatedAt(),
                client.getUpdatedAt());
    }
}
