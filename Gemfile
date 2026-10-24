source "https://rubygems.org"

# Run with `bundle exec jekyll serve`.
gem "jekyll", "~> 3.8"

# Fixes `jekyll serve` in ruby 3
gem "webrick"

# Required for Medium posts plugin
gem "nokogiri"

# Standard-library gems Jekyll 3.9 loads; newer Rubies no longer ship them as defaults
gem "base64"
gem "bigdecimal"
gem "csv"
gem "json"
gem "logger"

group :jekyll_plugins do
  gem "jekyll-include-cache"
  gem "jekyll-seo-tag"
  gem "jekyll-sitemap"
  gem "jekyll-redirect-from"
  gem "jekyll-last-modified-at"
end

gem 'wdm' if Gem.win_platform?
gem "tzinfo-data" if Gem.win_platform?

gem "kramdown-parser-gfm"
