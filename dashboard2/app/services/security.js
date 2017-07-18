import { enums } from '../models/enums';
import { routes } from '../models/urls';
import { globals } from '../models/globals';
import { storage } from './storage';

let self;
class Security {

  constructor(bindingEngine) {
    self = this;
    this.userInfo = null;

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
