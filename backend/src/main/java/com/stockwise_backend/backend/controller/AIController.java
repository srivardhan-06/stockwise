package com.stockwise_backend.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:3000")
public class AIController {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> body) {
        try {
            List<Map<String, Object>> messages =
                (List<Map<String, Object>>) body.get("messages");
            String systemPrompt = body.getOrDefault("system", "").toString();

            // Build Gemini contents array
            List<Map<String, Object>> contents = new ArrayList<>();

            // Add system prompt as first exchange
            if (systemPrompt != null && !systemPrompt.isEmpty()) {
                contents.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", systemPrompt))
                ));
                contents.add(Map.of(
                    "role", "model",
                    "parts", List.of(Map.of("text", "Understood. I am Sage, your Stockwise AI assistant. I have full access to your store data and will help you analyze it accurately."))
                ));
            }

            // Add conversation history
            for (Map<String, Object> msg : messages) {
                String role       = msg.get("role").toString();
                String content    = msg.get("content").toString();
                String geminiRole = role.equals("assistant") ? "model" : "user";
                contents.add(Map.of(
                    "role", geminiRole,
                    "parts", List.of(Map.of("text", content))
                ));
            }

            // Build request
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);
            requestBody.put("generationConfig", Map.of(
                "maxOutputTokens", 1000,
                "temperature", 0.7
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(geminiUrl, request, Map.class);

            // Parse Gemini response
            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> candidates =
                (List<Map<String, Object>>) responseBody.get("candidates");

            if (candidates == null || candidates.isEmpty()) {
                return ResponseEntity.status(500).body(Map.of("error", "No response from Gemini"));
            }

            Map<String, Object> candidate  = candidates.get(0);
            Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
            String text = parts.get(0).get("text").toString();

            // Return in same format as Anthropic so React needs no changes
            return ResponseEntity.ok(Map.of(
                "content", List.of(Map.of("type", "text", "text", text))
            ));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Gemini error: " + e.getMessage()));
        }
    }
}
