package io.javabrains.springsecurityjpa.models;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javassist.bytecode.Descriptor.Iterator;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class MyUserDetails implements UserDetails {

    private String userName;
    private String password;
    private boolean active;
    private List<GrantedAuthority> authorities;
    private UUID token;



	public MyUserDetails(User user) {
        this.userName = user.getUserName();
        this.password = user.getPassword();
        this.active = user.isActive();
        
        Collection<Role> c = user.getRoles();
        
        String strroles[] = new String[user.getRoles().size()];
        int i=0;
        for( java.util.Iterator<Role> ir = c.iterator(); ir.hasNext();) {
        	Role r = ir.next();
        	strroles[i++] = r.getRoleName();
        }
        
        this.authorities = Arrays.stream(strroles)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return userName;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }



	public UUID getToken() {
		return token;
	}

	public void setToken(UUID token) {
		this.token = token;
	}
  	
    
}
