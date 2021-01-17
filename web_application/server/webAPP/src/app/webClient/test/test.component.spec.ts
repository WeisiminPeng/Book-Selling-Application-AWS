import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TestComponent } from './test.component';

describe('TestComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let de: DebugElement;
  

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });

  it('sets "subject" to "world" by default', () => {
    expect(component.subject).toBe('world');
  });
it('greets the subject', () => {
    const h1 = de.query(By.css('h1'));
    expect(h1.nativeElement.innerText).toBe('Hello world!');
  });
it('updates the subject', () => {
    component.subject = 'developer';
    fixture.detectChanges();
    const h1 = de.query(By.css('h1'));
    expect(h1.nativeElement.innerText).toBe('Hello developer!');
  });
});
