import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user-service';

@Component({
  selector: 'app-profile-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-dashboard.html',
  styleUrls: ['./profile-dashboard.css']
})
export class ProfileDashboard implements OnInit {
  userData: User | null = null;
  profileData: User | null = null;
  profileForm!: FormGroup;
  isEditing: boolean = false;
  private snapshot: any = {}; 

  constructor(private fb: FormBuilder, private userService: UserService) {}

 ngOnInit() {
  // 1. Subscribe to the observable stream
  this.userService.currentUser$.subscribe(user => {
    if (user) {
      this.profileData = user;
      this.initForm(); // This will rebuild the form once data arrives
      console.log('Profile data loaded:', user);
    }
  });

  // 2. Trigger a check in case the app was refreshed
  // This will call the /me endpoint and repopulate RAM if the token is valid
  this.userService.checkSession();
}

  initForm() {
    if (!this.profileData) return;
  
    this.snapshot = {
      name: this.profileData.name || '',
      email: this.profileData.email || '',
      password: this.profileData.password || '',
      shippingAddress: this.profileData.shippingAddress || '',
      paymentDetails: this.profileData.paymentDetails || ''
    };

    this.profileForm = this.fb.group({
      name: [this.snapshot.name, [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      email: [this.snapshot.email, [Validators.required, Validators.email]],
      password: [this.snapshot.password, [
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]],
      shippingAddress: [this.snapshot.shippingAddress, [Validators.required, Validators.minLength(10)]],
      paymentDetails: [this.snapshot.paymentDetails, [Validators.required]]
    });

    this.profileForm.valueChanges.subscribe(currentValues => {
      const isStillOriginal = this.checkIfUnchanged(currentValues);
      
      if (isStillOriginal) {
        this.profileForm.markAsPristine();
      } else {
        this.profileForm.markAsDirty();
      }
    });
  }

  private checkIfUnchanged(currentValues: any): boolean {
    return Object.keys(this.snapshot).every(key => {
      return String(currentValues[key] ?? '') === String(this.snapshot[key] ?? '');
    });
  }

  enableEdit() {
    this.isEditing = true;
    if (this.profileData) {
      this.snapshot = {
        name: this.profileData.name || '',
        email: this.profileData.email || '',
        password: this.profileData.password || '',
        shippingAddress: this.profileData.shippingAddress || '',
        paymentDetails: this.profileData.paymentDetails || ''
      };
      this.profileForm.patchValue(this.snapshot);
      this.profileForm.markAsPristine();
    }
  }

  saveChanges() {
    if (this.profileForm.pristine || this.checkIfUnchanged(this.profileForm.value)) {
      this.isEditing = false;
      return;
    }

    if (this.profileForm.valid) {
      const updatedUser = { ...this.profileData, ...this.profileForm.value };
      
      this.userService.updateProfile(updatedUser).subscribe({
        next: (res) => {
          this.profileData = res.user;
          this.isEditing = false;
          this.initForm(); 
          alert('Profile updated successfully!');
        },
        error: (err) => {
          console.error('Update failed:', err);
          alert('Could not update profile.');
        }
      });
    }
  }

  cancel() {
    this.isEditing = false;
    this.initForm(); 
  }
}