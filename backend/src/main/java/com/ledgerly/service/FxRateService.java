package com.ledgerly.service;

import com.ledgerly.web.dto.FxRatesResponse;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class FxRateService {

    private static final long CACHE_SECONDS = 6 * 60 * 60;
    private static final Map<String, Double> FALLBACK = Map.of("USD", 0.25, "EUR", 0.23);

    private final RestClient restClient = RestClient.create();
    private final AtomicReference<CachedRates> cache = new AtomicReference<>();

    public FxRatesResponse latestFromPln() {
        CachedRates cached = cache.get();
        if (cached != null && Instant.now().isBefore(cached.expiresAt())) {
            return cached.response();
        }
        try {
            FrankfurterPayload payload = restClient
                    .get()
                    .uri("https://api.frankfurter.dev/v1/latest?base=PLN&symbols=USD,EUR")
                    .retrieve()
                    .body(FrankfurterPayload.class);
            if (payload == null || payload.rates() == null || payload.rates().isEmpty()) {
                return fallback();
            }
            FxRatesResponse response = new FxRatesResponse(
                    "PLN",
                    payload.date() != null ? payload.date() : Instant.now().toString().substring(0, 10),
                    payload.rates());
            cache.set(new CachedRates(response, Instant.now().plusSeconds(CACHE_SECONDS)));
            return response;
        } catch (Exception ex) {
            if (cached != null) {
                return cached.response();
            }
            return fallback();
        }
    }

    private FxRatesResponse fallback() {
        return new FxRatesResponse("PLN", Instant.now().toString().substring(0, 10), FALLBACK);
    }

    private record FrankfurterPayload(String date, Map<String, Double> rates) {}

    private record CachedRates(FxRatesResponse response, Instant expiresAt) {}
}
