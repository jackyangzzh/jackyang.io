require "net/http"
require "nokogiri"
require "openssl"
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
      uri = URI(feed_url)

      feed = Nokogiri::XML(fetch_feed(uri))
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

    def fetch_feed(uri)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.open_timeout = 5
      http.read_timeout = 10
      http.verify_mode = OpenSSL::SSL::VERIFY_PEER

      request = Net::HTTP::Get.new(uri.request_uri)
      request["User-Agent"] = "Jekyll Medium Posts Generator"
      response = http.request(request)

      unless response.is_a?(Net::HTTPSuccess)
        raise "feed request failed with #{response.code} #{response.message}"
      end

      response.body
    rescue OpenSSL::SSL::SSLError, Net::OpenTimeout, Net::ReadTimeout, SocketError => e
      Jekyll.logger.warn "MediumPosts:", "Ruby fetch failed (#{e.message}); retrying with curl."
      stdout, stderr, status = Open3.capture3(
        "curl",
        "-fsSL",
        "--connect-timeout",
        "5",
        "--max-time",
        "15",
        uri.to_s,
      )

      raise "curl feed request failed: #{stderr.strip}" unless status.success?

      stdout
    end
  end
end
