import { Component } from '@angular/core';

@Component({
  selector: 'app-footer-component',
  imports: [],
  templateUrl: './footer-component.html',
  styleUrl: './footer-component.css',
})
export class FooterComponent {
 footDate = new Date();
 copyRight : string=`ecom ${this.footDate.getFullYear()}.All Rights Reserved.`
}
