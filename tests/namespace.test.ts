import { assert } from "console";
import Namespace from "../src/namespace";

describe("Base tests", () => {
  it("should create Library", () => {
    var x = new Namespace('Games.World');
    var y: any = {};
    var z = x.goto('Games.World');

    x.applyTo(y, 'Hello');

    expect(y.Hello.Games.World).toBe(z);
  });
});
