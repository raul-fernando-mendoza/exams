package io.javabrains.springsecurityjpa;

import java.util.HashMap;
import java.util.UUID;

import io.javabrains.springsecurityjpa.models.MyUserDetails;
import io.javabrains.springsecurityjpa.models.TokenGrant;
import io.javabrains.springsecurityjpa.models.User;

public final class TokenPool {
	private static HashMap<UUID, TokenGrant> tokens = new HashMap<UUID, TokenGrant>();
	
	public static UUID createToken() {
		return UUID.randomUUID();
	}
	public static void storeToken(UUID uuid, MyUserDetails user) {
		TokenGrant t = new TokenGrant(uuid, user);
		tokens.put(t.getUUID(), t);
	}
	public static MyUserDetails getUser(UUID uuid) {
		TokenGrant t = tokens.get(uuid);
		if( t != null && t.isValid() ) {
			return t.getUser();
			
		}
		tokens.remove(uuid);
		return null;
	}

}
