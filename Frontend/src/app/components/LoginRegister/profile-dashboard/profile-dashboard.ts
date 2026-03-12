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
  profileData : User|null=null;
  profileForm!: FormGroup;
  isEditing: boolean = false;

  constructor(private fb: FormBuilder, private userService: UserService) {}

ngOnInit() {
  console.log("Profile Component Loaded");
  const user = this.userService.loggedInUser;
  console.log("User from service:", user); // If this is null, the form won't init
  
  if (user) {
    this.profileData = user;
    this.initForm();
  }
}

  initForm() {
    if (!this.profileData) return;
    this.profileForm = this.fb.group({
      name: [this.profileData.name, [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      email: [this.profileData.email, [Validators.required, Validators.email]],
      password: [this.profileData.password, [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]],
      shippingAddress: [this.profileData.shippingAddress, [Validators.required, Validators.minLength(10)]],
      paymentDetails: [this.profileData.paymentDetails, [Validators.required]]
    });
  }

enableEdit() {
  console.log("Edit button clicked!");
  this.isEditing = true;
}

  // profile-dashboard.ts

saveChanges() {
  if (this.profileForm.valid) {
    const updatedUser = { ...this.profileData, ...this.profileForm.value };
    
    this.userService.updateProfile(updatedUser).subscribe({
      next: (res) => {
        alert('Profile updated successfully!');
        // res.user contains the fresh data from the DB
        this.profileData = res.user; 
        this.isEditing = false;
        // No need to call updateLocalUser here anymore because 
        // we added .pipe(tap(...)) in the service!
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
