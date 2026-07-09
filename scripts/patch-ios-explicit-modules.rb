#!/usr/bin/env ruby
# Disables Xcode explicit modules, which can cache stale ExpoModulesCore Swift headers.
require 'xcodeproj'

root = File.expand_path('..', __dir__)
paths = [
  File.join(root, 'ios/Pods/Pods.xcodeproj'),
  File.join(root, 'ios/Sobremesa.xcodeproj'),
]

paths.each do |path|
  next unless File.exist?(path)

  project = Xcodeproj::Project.open(path)
  project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['CLANG_ENABLE_EXPLICIT_MODULES'] = 'NO'
      config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
    end
  end
  project.build_configurations.each do |config|
    config.build_settings['CLANG_ENABLE_EXPLICIT_MODULES'] = 'NO'
    config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
  end
  project.save
  puts "Patched #{path}"
end
