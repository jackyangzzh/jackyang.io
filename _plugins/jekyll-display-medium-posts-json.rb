require "nokogiri"
require "open3"

module Jekyll
  class MediumPostsGenerator < Generator
    safe true
    priority :low

    def generate(site)
      username = site.config["medium_username"] || ENV["MEDIUM_USERNAME"]
      cached_posts = site.data["medium_posts_cache"]
      cached_posts = cached_posts.is_a?(Array) ? cached_posts : []
      site.data["medium_posts"] = cached_posts

      unless username
        if cached_posts.any?
          Jekyll.logger.warn "MediumPosts:", "no medium_username configured; using #{cached_posts.size} cached posts."
        else
          Jekyll.logger.warn "MediumPosts:", "no medium_username configured and no cached posts are available."
        end
        return
      end

      feed_url = "https://medium.com/feed/@#{username}"

      feed = Nokogiri::XML(fetch_feed(feed_url))
      feed.remove_namespaces!
      items = feed.xpath("//item")

      Jekyll.logger.info  "MediumPosts:", "got #{items.size} items"

      fetched_posts = items.map { |item| build_post(item) }
      fetched_posts.reject! { |post| post["title"].empty? || post["url"].empty? }

      if fetched_posts.any?
        site.data["medium_posts"] = fetched_posts
      elsif cached_posts.any?
        Jekyll.logger.warn "MediumPosts:", "parsed 0 items; using #{cached_posts.size} cached posts."
      else
        site.data["medium_posts"] = []
        Jekyll.logger.warn "MediumPosts:", "parsed 0 items and no cached posts are available."
      end
    rescue => e
      if cached_posts.any?
        Jekyll.logger.warn "MediumPosts:", "failed to fetch or parse (#{e.message}); using #{cached_posts.size} cached posts."
      else
        site.data["medium_posts"] = []
        Jekyll.logger.error "MediumPosts:", "failed to fetch or parse: #{e.message}"
      end
    end

    private

    def build_post(item)
      content_html = item.at_xpath("encoded")&.text.to_s
      content_html = item.at_xpath("description")&.text.to_s if content_html.empty?
      html = Nokogiri::HTML.fragment(content_html)
      description = html.search("p").map(&:to_html).join
      description = html.text if description.empty?

      {
        "title"       => item.at_xpath("title")&.text.to_s,
        "url"         => item.at_xpath("link")&.text.to_s,
        "date"        => item.at_xpath("pubDate")&.text.to_s,
        "thumbnail"   => html.at_css("img")&.[]("src"),
        "description" => description,
        "categories"  => item.xpath("category").map(&:text)
      }
    end

    # Use curl directly: macOS/Linux ship with a working CA bundle, while Ruby's
    # OpenSSL on some macOS setups fails CRL checks against Medium's CDN.
    def fetch_feed(url)
      stdout, stderr, status = Open3.capture3(
        "curl",
        "-fsSL",
        "--connect-timeout",
        "5",
        "--max-time",
        "15",
        "-A",
        "Jekyll Medium Posts Generator",
        url,
      )

      raise "curl feed request failed: #{stderr.strip}" unless status.success?

      stdout
    end
  end
end
