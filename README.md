# Logicalísimo Telephone Input
A jQuery plugin build on top of the [International Telephone Input](https://github.com/Bluefieldscom/intl-tel-input) plugin for extra configuration

Please don't forget to check [International Telephone Input](https://github.com/Bluefieldscom/intl-tel-input), as this plugin is mostly for in-house use :)

## Demo
The file index.html runs a small demo with minimal configuration

## Logicalísimo Features
On top of the International Telephone Input plugin feats, we added a few more
* Allows having two telephone inputs in the same view without any conflicts
* Special case for Mexican mobile numbers (+52 1)
* Can remove country flag dropdown in case you don't wanna use it
* Allows callbacks to use when the phone number has the correct length
* Can be easily hooked up with a form button

## Instructions
Almost the same instructions as the original plugin
1. Download!

2. Link the stylesheet and the sprites
  ```html
  <link rel="stylesheet" media="all" href="path/to/sprite.css" />
  <link rel="stylesheet" media="all" href="path/to/intlTelInput.css" />
  ```

3. Override the path to flags.png in your CSS
  ```css
  .iti-flag {background-image: url("path/to/flags.png");}
  ```
4. Add the plugin script and initialize it on a div element
  ```html
  <script type="text/javascript" src="path/to/jquery.min.js"></script>
  <script type="text/javascript" src="path/to/intlTelInput.min.js"></script>
  <script type="text/javascript" src="path/to/libphonenumber.js"></script>

  <div class="phone-container"></div>
  ```
5. Execute the script that uses the plugin.
  ```html
  <script>
    $("#mobile-number").logicalisimo({});
  </script>
  ```
  
6. The library libphonnumber used in this plugin can be called as utils(), and will be used as default to validate the phone numbers

## Options
The following options are the same as the International Telephone Input

**allowExtensions**  
Type: `Boolean` Default: `false`  
When `autoFormat` is enabled, this option will support formatting extension numbers e.g. "+1 (702) 123-1234 ext. 12345".

**autoFormat**  
Type: `Boolean` Default: `true`  
Format the number on each keypress according to the country-specific formatting rules. This will also prevent the user from entering invalid characters (triggering a red flash in the input - see [Troubleshooting](#troubleshooting) to customise this). Requires the `utilsScript` option.

**autoHideDialCode**  
Type: `Boolean` Default: `true`  
If there is just a dial code in the input: remove it on blur, and re-add it on focus. This is to prevent just a dial code getting submitted with the form. Requires `nationalMode` to be set to `false`.

**autoPlaceholder**  
Type: `Boolean` Default: `true`  
Add or remove input placeholder with an example number for the selected country. Requires the `utilsScript` option.

**defaultCountry**  
Type: `String` Default: `""`  
Set the default country by it's country code. You can also set it to `"auto"`, which will lookup the user's country based on their IP address - requires the `geoIpLookup` option - [see example](http://jackocnr.com/lib/intl-tel-input/examples/gen/default-country-ip.html). When instantiating the plugin, we now return a [deferred object](https://api.jquery.com/category/deferred-object/), so you can use `.done(callback)` to know when it is finished. If you leave `defaultCountry` blank, it will default to the first country in the list. _Note that if you choose to do the auto lookup, and you also happen to use the [jquery-cookie](https://github.com/carhartl/jquery-cookie) plugin, it will store the loaded country code in a cookie for future use._

**geoIpLookup**  
Type: `Function` Default: `null`  
When setting `defaultCountry` to `"auto"`, we need to use a special service to lookup the location data for the user. Write a custom method to get the country code. For example if you use [ipinfo.io](http://ipinfo.io/):  
```js
geoIpLookup: function(callback) {
  $.get('http://ipinfo.io', function() {}, "jsonp").always(function(resp) {
    var countryCode = (resp && resp.country) ? resp.country : "";
    callback(countryCode);
  });
}
```
_Note that the callback must still be called in the event of an error, hence the use of `always` in this example._

**nationalMode**  
Type: `Boolean` Default: `true`  
Allow users to enter national numbers (and not have to think about international dial codes). Formatting, validation and placeholders still work. Then you can use `getNumber` to extract a full international number - [see example](http://jackocnr.com/lib/intl-tel-input/examples/gen/national-mode.html). This option now defaults to `true`, and it is recommended that you leave it that way as it provides a better experience for the user.

**numberType**  
Type: `String` Default: `"MOBILE"`  
Specify one of the keys from the global enum `intlTelInputUtils.numberType` e.g. `"FIXED_LINE"` to tell the plugin you're expecting that type of number. Currently this is only used to set the placeholder to the right type of number.

**onlyCountries**  
Type: `Array` Default: `undefined`  
Display only the countries you specify - [see example](http://jackocnr.com/lib/intl-tel-input/examples/gen/only-countries-europe.html).

**preferredCountries**  
Type: `Array` Default: `["us", "gb"]`  
Specify the countries to appear at the top of the list.

**utilsScript**  
Type: `String` Default: `""` Example: `"lib/libphonenumber/build/utils.js"`  
Enable formatting/validation etc. by specifying the path to the included utils.js script, which is fetched only when the page has finished loading (on window.load) to prevent blocking. See [Utilities Script](#utilities-script) for more information. _Note that if you're lazy loading the plugin script itself (intlTelInput.js) this will not work and you will need to use the `loadUtils` method instead._


In adition to the original configuration options that the International Telephone Input allows the following

*onValidPhone**  
Type: `Function` Default: `empty function`
Allows a callback in case the phone number is the correct length

*onInvalidPhone**  
Type: `Function` Default: `empty function`
Allows a callback in case the phone number doesn't have the correct length

noIdentify
Type: `Boolean` Default: `true`
Flag to control if the input should execute the identifyCarrier function (modified by the user) 

noFlags
Type: `Boolean` Default: `false`
Flag (lol) used to hide the country selector 

flagsSubclass
Type: `String` Default: `''`
Extra class to give to the country selector NOTE: an extra class should be added in case there are more than one phone inputs on the view

buttonElID
Type: `String` Default: `phone-button`
Element id for the input's form entry button

elID
Type: `String` Default: `phone-input`
Element id you want to give to the phone input itself



## Public Methods
The following methods are again native to the input element itself, as it uses the International Telephone Input plugin. You might want to try them.

**destroy**  
Remove the plugin from the input, and unbind any event listeners.  
```js
$("#mobile-number").intlTelInput("destroy");
```

**getExtension**  
Get the extension part of the current number, so if the number was `"+1 (702) 123-1234 ext. 12345"` this would return `"12345"`.
```js
var extension = $("#mobile-number").intlTelInput("getExtension");
```
Returns a string e.g. `"12345"`

**getNumber**  
Get the current number in the given format (defaults to [E.164 standard](http://en.wikipedia.org/wiki/E.164)). The different formats are available in the enum `intlTelInputUtils.numberFormat` - taken from [here](https://github.com/googlei18n/libphonenumber/blob/master/javascript/i18n/phonenumbers/phonenumberutil.js#L883). Requires the `utilsScript` option. _Note that even if `nationalMode` is enabled, this can still return a full international number._  
```js
var intlNumber = $("#mobile-number").intlTelInput("getNumber");
// or
var ntlNumber = $("#mobile-number").intlTelInput("getNumber", intlTelInputUtils.numberFormat.NATIONAL);
```
Returns a string e.g. `"+17024181234"`

**getNumberType**  
Get the type (fixed-line/mobile/toll-free etc) of the current number. Requires the `utilsScript` option.  
```js
var numberType = $("#mobile-number").intlTelInput("getNumberType");
```
Returns an integer, which you can match against the [various options](https://github.com/googlei18n/libphonenumber/blob/master/javascript/i18n/phonenumbers/phonenumberutil.js#L896) in the global enum `intlTelInputUtils.numberType` e.g.  
```js
if (numberType == intlTelInputUtils.numberType.MOBILE) {
    // is a mobile number
}
```
_Note that in the US there's no way to differentiate between fixed-line and mobile numbers, so instead it will return `FIXED_LINE_OR_MOBILE`._

**getSelectedCountryData**  
Get the country data for the currently selected flag.  
```js
var countryData = $("#mobile-number").intlTelInput("getSelectedCountryData");
```
Returns something like this:
```js
{
  name: "Afghanistan (‫افغانستان‬‎)",
  iso2: "af",
  dialCode: "93"
}
```

**getValidationError**  
Get more information about a validation error. Requires the `utilsScript` option.  
```js
var error = $("#mobile-number").intlTelInput("getValidationError");
```
Returns an integer, which you can match against the [various options](https://github.com/Bluefieldscom/intl-tel-input/blob/master/lib/libphonenumber/src/utils.js#L175) in the global enum `intlTelInputUtils.validationError` e.g.  
```js
if (error == intlTelInputUtils.validationError.TOO_SHORT) {
    // the number is too short
}
```

**isValidNumber**  
Validate the current number - [see example](http://jackocnr.com/lib/intl-tel-input/examples/gen/is-valid-number.html). Expects an internationally formatted number (unless `nationalMode` is enabled). If validation fails, you can use `getValidationError` to get more information. Requires the `utilsScript` option. Also see `getNumberType` if you want to make sure the user enters a certain type of number e.g. a mobile number.  
```js
var isValid = $("#mobile-number").intlTelInput("isValidNumber");
```
Returns: `true`/`false`

**loadUtils**  
_Note: this is only needed if you're lazy loading the plugin script itself (intlTelInput.js). If not then just use the `utilsScript` option._  
Load the utils.js script (included in the lib directory) to enable formatting/validation etc. See [Utilities Script](#utilities-script) for more information.
```js
$("#mobile-number").intlTelInput("loadUtils", "lib/libphonenumber/build/utils.js");
```

**selectCountry**  
Change the country selection (e.g. when the user is entering their address).  
```js
$("#mobile-number").intlTelInput("selectCountry", "gb");
```

**setNumber**  
Insert a number, and update the selected flag accordingly. Optionally pass a `intlTelInputUtils.numberFormat` as the second argument if you want to specify national/international formatting (must be a valid number). _Note that by default, if `nationalMode` is enabled it will try to use national formatting._  
```js
$("#mobile-number").intlTelInput("setNumber", "+44 7733 123 456");
```


## Static Methods
**getCountryData**  
Get all of the plugin's country data - either to re-use elsewhere e.g. to populate a country dropdown - [see example](http://jackocnr.com/lib/intl-tel-input/examples/gen/country-sync.html), or to modify - [see example](http://jackocnr.com/lib/intl-tel-input/examples/gen/modify-country-data.html). Note that any modifications must be done before initialising the plugin.  
```js
var countryData = $.fn.intlTelInput.getCountryData();
```
Returns an array of country objects:
```js
[{
  name: "Afghanistan (‫افغانستان‬‎)",
  iso2: "af",
  dialCode: "93"
}, ...]
```


## Attributions
* International Telephone Input [International Telephone Input](https://github.com/Bluefieldscom/intl-tel-input)
* Flag images from [region-flags](https://github.com/behdad/region-flags)
* Original country data from mledoze's [World countries in JSON, CSV and XML](https://github.com/mledoze/countries)
* Formatting/validation/example number code from [libphonenumber](http://libphonenumber.googlecode.com)
* Lookup user's country using [ipinfo.io](http://ipinfo.io)
* Feature contributions are listed in the wiki: [Contributions](https://github.com/Bluefieldscom/intl-tel-input/wiki/Contributions)
* List of [sites using intl-tel-input](https://github.com/Bluefieldscom/intl-tel-input/wiki/Sites-using-intl-tel-input)
