#import "IdreesiaSceneDelegate.h"

#import <Cordova/CDVAppDelegate.h>
#import <Cordova/CDVViewController.h>

// cordova-ios 7's CDVAppDelegate builds its window in
// application:didFinishLaunchingWithOptions: with initWithFrame:. Under the
// scene life cycle a window only shows when it belongs to a UIWindowScene, so
// when iOS connects the app's scene this moves Cordova's view controller into
// a window attached to that scene and hands the window back to the app
// delegate (plugins read appDelegate.window).
//
// Opening the app from a URL arrives here instead of the app delegate under
// scenes, so those are forwarded to CDVAppDelegate's
// application:openURL:options:, which notifies Cordova plugins as before.

@implementation IdreesiaSceneDelegate

- (CDVAppDelegate *)cordovaAppDelegate {
  id<UIApplicationDelegate> delegate = UIApplication.sharedApplication.delegate;
  return [(NSObject *)delegate isKindOfClass:[CDVAppDelegate class]]
             ? (CDVAppDelegate *)delegate
             : nil;
}

- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions {
  if (![scene isKindOfClass:[UIWindowScene class]]) return;

  CDVAppDelegate *appDelegate = [self cordovaAppDelegate];
  UIViewController *rootViewController = appDelegate.viewController;
  if (rootViewController == nil) {
    // didFinishLaunching always runs first and creates it; this is a
    // fallback so the app still shows something.
    rootViewController = [[CDVViewController alloc] init];
    appDelegate.viewController = (CDVViewController *)rootViewController;
  }

  // Detach the controller from the frame-based window the app delegate made.
  UIWindow *previousWindow = appDelegate.window;
  if (previousWindow != nil && previousWindow.rootViewController == rootViewController) {
    previousWindow.rootViewController = nil;
    previousWindow.hidden = YES;
  }

  UIWindow *window = [[UIWindow alloc] initWithWindowScene:(UIWindowScene *)scene];
  window.autoresizesSubviews = YES;
  window.rootViewController = rootViewController;
  self.window = window;
  appDelegate.window = window;
  [window makeKeyAndVisible];

  [self openURLContexts:connectionOptions.URLContexts];
}

- (void)scene:(UIScene *)scene openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts {
  [self openURLContexts:URLContexts];
}

- (void)openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts {
  CDVAppDelegate *appDelegate = [self cordovaAppDelegate];
  if (appDelegate == nil) return;

  for (UIOpenURLContext *context in URLContexts) {
    NSMutableDictionary<UIApplicationOpenURLOptionsKey, id> *options =
        [NSMutableDictionary dictionary];
    if (context.options.sourceApplication) {
      options[UIApplicationOpenURLOptionsSourceApplicationKey] =
          context.options.sourceApplication;
    }
    if (context.options.annotation) {
      options[UIApplicationOpenURLOptionsAnnotationKey] = context.options.annotation;
    }
    [appDelegate application:UIApplication.sharedApplication
                     openURL:context.URL
                     options:options];
  }
}

@end
