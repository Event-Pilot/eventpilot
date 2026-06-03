package com.eventpilot.manager;

import java.security.SecureRandom;
import org.springframework.stereotype.Component;

@Component
public class IdGenerator {

  private static final char[] ALPHABET =
      "_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();

  private final SecureRandom random = new SecureRandom();

  public String nanoid(int length) {
    StringBuilder id = new StringBuilder(length);
    for (int i = 0; i < length; i++) {
      id.append(ALPHABET[random.nextInt(ALPHABET.length)]);
    }
    return id.toString();
  }
}
