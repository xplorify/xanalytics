import { BindingEngine } from 'aurelia-binding';
import { inject } from 'aurelia-framework';

let self;
@inject(BindingEngine)
class Security {

  constructor(bindingEngine) {
    self = this;
    this.userInfo = null;
    this.bindingEngine = bindingEngine;

    if (this.userInfo) {
      let userInfoSubscription = this.bindingEngine.propertyObserver(this.userInfo, 'userInfo')
        .subscribe((newValue, oldValue) => console.log(newValue));
    }
  }

  setAuthInfo(data) {
    self.userInfo = {
      id: data.user._id,
      userName: data.user.username,
      roles: data.user.roles,
      accessToken: data.token
    };
  }
}

export let security = new Security();
