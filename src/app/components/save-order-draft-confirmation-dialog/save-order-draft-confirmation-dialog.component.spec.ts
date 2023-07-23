import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SaveOrderDraftConfirmationDialogComponent } from './save-order-draft-confirmation-dialog.component';

describe('SaveOrderDraftConfirmationDialogComponent', () => {
  let component: SaveOrderDraftConfirmationDialogComponent;
  let fixture: ComponentFixture<SaveOrderDraftConfirmationDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveOrderDraftConfirmationDialogComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SaveOrderDraftConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
