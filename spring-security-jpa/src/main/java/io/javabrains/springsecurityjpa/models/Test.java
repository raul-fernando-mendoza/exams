package io.javabrains.springsecurityjpa.models;

import java.util.ArrayList;
import java.util.Collection;


import javax.persistence.*;

import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;

@Entity
@Table(name = "test")
public class Test {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private String test_name;
    
    @ManyToMany(cascade = CascadeType.ALL)
    @LazyCollection(LazyCollectionOption.FALSE)
	private Collection<Question> questions = new ArrayList<Question>();

 

	public Collection<Question> getQuestions() {
		return questions;
	}

	public void setQuestions(Collection<Question> questions) {
		this.questions = questions;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getTest_name() {
		return test_name;
	}

	public void setTest_name(String test_name) {
		this.test_name = test_name;
	}



}
