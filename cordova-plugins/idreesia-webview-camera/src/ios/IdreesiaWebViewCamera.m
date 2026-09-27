#import "IdreesiaWebViewCamera.h"

#import <WebKit/WebKit.h>
#import <objc/runtime.h>

// cordova-ios's WKUIDelegate doesn't implement the media-capture permission
// callback, so WKWebView falls back to asking "localhost would like to access
// the camera" on every launch, on top of iOS's own camera permission. This
// adds the callback to that delegate: camera requests from the app's own
// pages (served by Meteor from http://localhost) are granted, and anything
// else gets WebKit's default prompt. iOS still asks for camera access the
// first time, using NSCameraUsageDescription.

@implementation IdreesiaWebViewCamera

- (void)pluginInitialize {
  if (@available(iOS 15.0, *)) {
    if (![self.webView isKindOfClass:[WKWebView class]]) return;
    WKWebView *webView = (WKWebView *)self.webView;
    id<WKUIDelegate> delegate = webView.UIDelegate;
    if (!delegate) return;

    SEL selector = @selector(webView:requestMediaCapturePermissionForOrigin:initiatedByFrame:type:decisionHandler:);
    if (![delegate respondsToSelector:selector]) {
      IMP implementation = imp_implementationWithBlock(^(id _self, WKWebView *requestingWebView,
                                                         WKSecurityOrigin *origin, WKFrameInfo *frame,
                                                         WKMediaCaptureType type,
                                                         void (^decisionHandler)(WKPermissionDecision)) {
        BOOL isAppPage = [origin.host isEqualToString:@"localhost"];
        BOOL isCameraOnly = type == WKMediaCaptureTypeCamera;
        decisionHandler(isAppPage && isCameraOnly ? WKPermissionDecisionGrant : WKPermissionDecisionPrompt);
      });
      // v = void, @ = self, : = _cmd, then webView, origin, frame (objects),
      // type (NSInteger), decisionHandler (block).
      class_addMethod([delegate class], selector, implementation, "v@:@@@q@?");
    }

    // WKWebView checks which optional delegate methods exist when the
    // delegate is assigned, so assign it again for the new one to be used.
    webView.UIDelegate = nil;
    webView.UIDelegate = delegate;
  }
}

@end
