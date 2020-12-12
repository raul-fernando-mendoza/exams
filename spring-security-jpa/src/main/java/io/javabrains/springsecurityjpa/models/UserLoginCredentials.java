package io.javabrains.springsecurityjpa.models;

import java.util.Collection;

public class UserLoginCredentials {
	private String username;
	private String token;
	private Collection<String> roles;
	


	public Collection<String> getRoles() {
		return roles;
	}

	public void setRoles(Collection<String> roles) {
		this.roles = roles;
	}

	public UserLoginCredentials(){
		
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}


	
	
}
