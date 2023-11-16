

export class InvalidUserError extends Error {
  constructor(message = "Invalid User") {
    super(message);
    this.name = "InvalidUserError";

    // This is necessary when extending native JavaScript classes like Error
    Object.setPrototypeOf(this, InvalidUserError.prototype);
  }
}

export class DeserializeUserError extends Error {
  constructor(message = "Invalid User") {
    super(message);
    this.name = "DeserializeUserError";

    // This is necessary when extending native JavaScript classes like Error
    Object.setPrototypeOf(this, InvalidUserError.prototype);
  }
}



export class UserNotConfirmed extends Error {
  constructor(message = "User Not Confirmed") {
    super(message);
    this.name = "UserNotConfirmed";

    // This is necessary when extending native JavaScript classes like Error
    Object.setPrototypeOf(this, UserNotConfirmed.prototype);
  }
}
