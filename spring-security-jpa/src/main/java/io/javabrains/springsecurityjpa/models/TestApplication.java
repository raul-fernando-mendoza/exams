package io.javabrains.springsecurityjpa.models;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;

@Entity
@Table(name = "test_application")
public class TestApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    @OneToOne(cascade = CascadeType.ALL)
    @LazyCollection(LazyCollectionOption.FALSE)
	private Test test;
    
    @OneToOne(cascade = CascadeType.ALL)
    @LazyCollection(LazyCollectionOption.FALSE)
    private User teacher;
    
     
    
    @OneToOne(fetch = FetchType.EAGER,  cascade = CascadeType.ALL)
    private User student;
    
    double grade;
    
    boolean completed;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public Test getTest() {
		return test;
	}

	public void setTest(Test test) {
		this.test = test;
	}

	public User getTeacher() {
		return teacher;
	}

	public void setTeacher(User teacher) {
		this.teacher = teacher;
	}

	public User getStudent() {
		return student;
	}

	public void setStudent(User student) {
		this.student = student;
	}

	public double getGrade() {
		return grade;
	}

	public void setGrade(double grade) {
		this.grade = grade;
	}

	public boolean isCompleted() {
		return completed;
	}

	public void setCompleted(boolean completed) {
		this.completed = completed;
	}

}
